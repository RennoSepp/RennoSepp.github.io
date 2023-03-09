// The following functions define selectors for the example UI
// Replace these with selectors for your UI.

function findQueuingInstructionsElement() {
    return document.querySelector('div.instructions');
}

function findQueueElement(queueName) {
    return document.querySelector("div.queue[queue_name='" + queueName + "']");
}

function findAllQueueElements() {
    return document.querySelectorAll('div.queue');
}

function findAllQueueMediaButtons() {
    return document.querySelectorAll('div.queue > button.media_button');
}

function findMediaButtonsForQueue(queueElement) {
    return queueElement.querySelectorAll('button.media_button');
}

function findCancelButton() {
    return document.querySelector('button.cancel');
}

function getMediaButtonQueueName(button) {
    return button.parentElement.getAttribute('queue_name');
}

function getButtonMedium(button) {
    return button.getAttribute('medium');
}







function hide(element) {
    element.style.display = 'none';
}

function show(element) {
    element.style.display = 'block';
}

function showCanQueue(queueElement, queueMedias) {
    // Queue is open, a set of medias available
    queueElement.style['text-decoration'] = 'none';
    updateQueueAvailableMedia(queueElement, queueMedias);
}

function showCannotQueue(queueElement) {
    // Queue is closed
    queueElement.style['text-decoration'] = 'line-through';
    updateQueueAvailableMedia(queueElement, []); // Disables all media buttons
}

function showCannotQueueAnywhere() {
    findAllQueueElements().forEach(showCannotQueue);
}

function showFailedToQueueView(error) {
    findQueuingInstructionsElement().innerText = 'Sorry! Currently unavailable.';
}

function showCanQueueView() {
    findQueuingInstructionsElement().innerHTML =
        'Please select a queue and click a media button';
}

function showAlreadyQueuedView() {
    findQueuingInstructionsElement().innerText =
        'Please wait, you will be connected shortly';
}

function showCannotQueueView() {
    findQueuingInstructionsElement().innerText = 'Queueing is currently disabled';
}

function updateQueueAvailableMedia(queueElement, medias) {
    findMediaButtonsForQueue(queueElement).forEach(function (button) {
        var mediaUnavailable = medias.indexOf(getButtonMedium(button)) === -1;
        button.disabled = mediaUnavailable;
    });
}

// The following functions integrate an user interface with multiple queue
// buttons with Glia SDK.

var queueTicket; // Reference to an ongoing QueueTicket. Used for cancellation.

// Bind clicks on queue buttons with Glia SDK
function listenForQueueButtonClicks(salemove, queues) {
    findAllQueueMediaButtons().forEach(function (mediaButton) {
        // Gather properties from UI element
        var buttonQueueName = getMediaButtonQueueName(mediaButton);
        var buttonMedium = getButtonMedium(mediaButton);
        // Find queue ID by matching the queue name to button queue name
        var queueId = queues
            .filter(function (queue) {
                return queue.name === buttonQueueName;
            })
            .map(function (queue) {
                return queue.id;
            })[0];

        if (queueId === undefined) {
            throw new Error(
                'Queue button present, but queue not defined in Glia. Queue name: ' +
                buttonQueueName
            );
        }

        // Queue upon button click
        mediaButton.addEventListener('click', function () {
            if (buttonMedium === 'phone') {
                textBox = document.createElement("input");
                submitButton = document.createElement("button");
                textBox.setAttribute("type", "text");
                textBox.setAttribute("id", "phoneNumberTextBox")
                submitButton.setAttribute("id", "phoneNumberSubmitButton")
                
                document.body.appendChild(textBox);
                document.body.appendChild(submitButton);
                submitButton.addEventListener("click", callPhoneNumber);
            } else {
                salemove
                    .queueForEngagement(buttonMedium, { queueId: queueId })
                    .catch(showFailedToQueueView);
            }
        });
    });
}

function callPhoneNumber(){
    var visitorPhoneNumber = document.getElementById("phoneNumberTextBox").value;
    var buttonMedium = 'phone'
    salemove.queueForEngagement(buttonMedium, {
            queueId: queueId,
            phoneNumber: visitorPhoneNumber
        }).catch(showFailedToQueueView);
}


// Bind click on cancel button with QueueTicket cancellation
function listenForCancel() {
    findCancelButton().addEventListener('click', function () {
        if (queueTicket) {
            queueTicket.cancel();
        } else {
            throw new Error('Cannot cancel queuing while not queued');
        }
    });
}

// Handle queue state changes for a particular queue.
// Enable queuing and media buttons for available media if open, disable
// otherwise.
function onQueueState(queue) {
    if (findQueueElement(queue.name) === null) {
        // Queue not related to the current page, ignore
    } else if (queue.state.status === queue.state.STATUSES.OPEN) {
        showCanQueue(findQueueElement(queue.name), queue.state.medias);
    } else {
        showCannotQueue(findQueueElement(queue.name));
    }
}

// Handle general visitor queuing state changes.
// Adapt this function to match your desired user interface.
// Note that these changes are for a particular visitor and must not conflict
// with the state that is written in `onQueueState` listener. Here two
// different dimensions, disabled and hidden, are used to avoid conflicts.
function onVisitorQueueingState(queuingState) {
    // Disable queuing if visitor is already queued.
    if (queuingState.state === queuingState.QUEUE_STATES.QUEUED) {
        queueTicket = queuingState.ticket;
        findAllQueueElements().forEach(hide);
        show(findCancelButton());
        showAlreadyQueuedView();
    } else if (queuingState.state === queuingState.QUEUE_STATES.CANNOT_QUEUE) {
        // Disable queueing when queueing state changed to `CANNOT_QUEUE`
        // which can happen due do various reasons.
        // See the full list of possible transition reasons in our JS SDK
        // https://sdk-docs.glia.com/visitor-js-api/current/class/AggregateQueueState.html#TRANSITION_REASONS-variable
        queueTicket = null;
        findAllQueueElements().forEach(hide);
        hide(findCancelButton());
        showCannotQueueView();
    } else {
        // Enable queuing otherwise
        queueTicket = null;
        findAllQueueElements().forEach(show);
        hide(findCancelButton());
        showCanQueueView();
    }
}

// Get Glia SDK and bind listeners.
sm.getApi({ version: 'v1' }).then(function (salemove) {
    console.log("Hello world!");
    salemove.addEventListener(
        salemove.EVENTS.QUEUE_STATE_UPDATE,
        onVisitorQueueingState
    );
    listenForCancel();

    salemove.getQueues().then(function (queues) {
        listenForQueueButtonClicks(salemove, queues);

        var queueIds = queues.map(function (queue) {
            return queue.id;
        });
        salemove.subscribeToQueueStateUpdates(queueIds, onQueueState);
    });
});