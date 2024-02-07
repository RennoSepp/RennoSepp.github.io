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
        'Let me give you a call if you need any help!';
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
            console.log("VAJUTUS");
            if (buttonMedium === 'phone') {
                if (document.getElementById('phoneNumberTextBox') == null) {
                    textBox = document.createElement("input");
                    submitButton = document.createElement("button");
                    textBox.setAttribute("type", "text");
                    textBox.setAttribute("id", "phoneNumberTextBox");
                    submitButton.setAttribute("id", "phoneNumberSubmitButton");
                    submitButton.textContent = "Click here to engage";
                    document.getElementById("phoneEngagementButton").appendChild(textBox);
                    document.getElementById("phoneEngagementButton").appendChild(submitButton);
                    document.getElementById("phoneEngagementTabButton").hide;
                    }
                 submitButton.addEventListener("click", function () {
                        console.log("HEA");
                        var visitorPhoneNumber = document.getElementById("phoneNumberTextBox").value;
                        salemove
                            .queueForEngagement(buttonMedium, {
                                queueId: queueId,
                                phoneNumber: visitorPhoneNumber
                            }).catch(showFailedToQueueView);
                    });
          
            } else {
                console.log("HALB");
                salemove
                    .queueForEngagement(buttonMedium, { queueId: queueId })
                    .catch(showFailedToQueueView);
            }
        });
    });
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

const message = '<a data-sm-show-media-selection-on="click" href="javascript:void(0);">Contact Us</a>';
//const phoneArr = Array.from(document.body.querySelectorAll(".phone-number"));

sm.getApi({version: 'v1'}).then((glia) => {
      var testersters = function (engagement) {
        var cobrowser = engagement.cobrowser;
        console.log("241t4q365");
        cobrowser.addBufferedEventListener(cobrowser.EVENTS.MODE_CHANGE, function(cobrowsingState) {
        console.log("testtestetse");
      if (cobrowsingState.mode === engagement.cobrowser.MODES.ENGAGEMENT) {
        console.log("engagement");
        } else if (cobrowsingState.mode === engagement.cobrowser.MODES.POINTER) {
            console.log("pointer");
        } else if (cobrowsingState.mode === engagement.cobrowser.MODES.OBSERVATION) {
            console.log("observation");
        }
    }
  )};
    console.log("jõuame1");
    //test the functionality of MODES change for cobrowsing:
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, testersters);
    console.log("jõuame12");
});
sm.getApi({version: 'v1'}).then((glia) => {                 
function attachQueueStatusLogic () {
        var ignoredQueueIds = ["fbc90f45-0d60-4004-ad84-6606b5471d67"]; // Placeholder Queue ID can be added here
        // Fetch the initial state of the queue
        glia.getQueues().then(function (queues) {
            // To be able to conveniently look up queues by their IDs
            var queuesByIds = queues.reduce(function (res, queue) {
                var queueId = queue.id;
                if (!ignoredQueueIds.includes(queueId)) {
                    res[queueId] = queue;
                }
                return res;
            }, {});

            var queueIds = Object.keys(queuesByIds);

            maybeTriggerQueueMediaSelection = function () {
                // Find all queues which are currently in OPEN state
                const openedQueues = queueIds.reduce(function (res, queueId) {
                    var queue = queuesByIds[queueId];
                    if (queue.state.status === queue.state.STATUSES.OPEN) {
                        res.push(queue);
                    }
                    return res;
                }, []);

                if (openedQueues.length > 0) {
                    // For now, setting whichever Queue is the first one in the list.
                    glia.visitorApp.triggerQueueMediaSelection(openedQueues[0]);
                }
            };

            // Update queues when they have new updates
            glia.subscribeToQueueStateUpdates(queueIds, function (queueUpdate) {
                queuesByIds[queueUpdate.id] = queueUpdate;
            });
        });
    };
    attachQueueStatusLogic();
  const onQueueStateUpdate = (queueState) => {
      
    // Replace phone number elements with the control when a queue with audio or phone ability is available.
    if (queueState.state === queueState.QUEUE_STATES.CAN_QUEUE &&
        (queueState.medias.includes('audio') ||
         queueState.medias.includes('phone'))) {
      // Replace all the phone numbers with the Contact Us control.
      phoneArr.forEach((elem) => {
        elem.innerHTML = message;
      });
    // Restore the original phone numbers when no queue with audio or phone media is available.
    } else if (queueState.state === queueState.QUEUE_STATES.CANNOT_QUEUE ||
               !(queueState.medias.includes('audio') ||
                 queueState.medias.includes('phone'))) {
      // Replace the Contact Us controls with the original phone numbers.
      phoneArr.forEach((elem) => {
        elem.innerHTML = elem.getAttribute("glia-phone-original");
      });
    }
  }

    

  // Store the initial situation to be able to replace it back and forth.
  //phoneArr.forEach((elem) => {
  //  elem.setAttribute("glia-phone-original", elem.innerHTML);
  //});

  // Add listener to act in case any queue state is changed.
  glia.addEventListener(glia.EVENTS.QUEUE_STATE_UPDATE, onQueueStateUpdate);
});

window.onload = function(){
  		sm.getApi({version: 'v1'}).then(function(glia) {
    			glia.updateInformation({
				"name-field": null,
				"name": "Toomas",
				"Name": null,
				"phone": null,
        			customAttributes: {}
    			}).then(function() {
			}).catch(function(error) {
      				if (error.cause == glia.ERRORS.NETWORK_TIMEOUT) {
      				} else {
				}
    			});
  		});
	};



window.onload = function () {
    sm.getApi({ version: 'v1' }).then(function (api) {
        let engagementChat;
        api.addEventListener(api.EVENTS.ENGAGEMENT_START, (engagement) => {
            engagementChat = engagement.chat;
        });
        api.visitorApp.setChatMessageRenderer(function (message) {
            const { metadata } = message;
            if (!metadata) {
                return false;
            }
            if (metadata.buttons) {
                return createButtonCard(message, engagementChat);
            }
            if (metadata.image_url) {
                return createImageElement(metadata);
            }
            if (metadata.bullets) {
		console.log("We are going to get bullets");
                return createBulletsCard(metadata.bullets, content);
            }
            return false;
        });
    });

    function createButtonCard(message, engagementChat) {
        const {
            metadata: { buttons },
            attachment,
            content,
        } = message;
        const { imageUrl } = attachment ?? {};
        const sendSelectedChoice = ({ selectedText, selectedValue }) => {
            engagementChat.sendMessage(selectedText, {
                attachment: {
                    type: 'single_choice_response',
                    selected_option: selectedValue,
                },
            });
        };
        const buildCardQuestionElm = (content) => {
            const cardQuestion = document.createElement('div');
            cardQuestion.classList.add('sm-choice-card-question');
            cardQuestion.innerHTML = content;
            return cardQuestion;
        };
        const buildCardImageElement = (imageUrl) => {
            const cardImage = document.createElement('div');
            cardImage.classList.add('sm-choice-card-image-container');
            cardImage.innerHTML = `<img src="${imageUrl}" />`;
            return cardImage;
        };
        const buildCardOptions = (buttons) => {
            const cardOptions = document.createElement('div');
            cardOptions.classList.add('sm-choice-card-options');
            const cardOptionsContainer = document.createElement('div');
            buttons.forEach(function ({ text, type, value }) {
                switch (type) {
                    case 'action': {
                        const option = document.createElement('div');
                        option.innerHTML = text;
                        option.addEventListener('click', function () {
                            sendSelectedChoice({
                                selectedText: text,
                                selectedValue: value,
                            });
                        });
                        option.style = `
                        font-weight: bold;
                        `;
                        cardOptionsContainer.appendChild(option);
                        break;
                    }
                    case 'external': {
                        const option = document.createElement('a');
                        option.innerHTML = text;
                        option.href = value;
                        option.target = '_blank';
                        option.style = `
                        align-items: center;
                        background-color: #efefef;
                        border-radius: 4px;
                        color: #353535;
                        cursor: pointer;
                        display: flex;
                        font-size: 12px;
                        justify-content: center;
                        line-height: 16px;
                        max-width: inherit;
                        min-width: -webkit-fill-available;
                        padding: 6px 20px;
                        margin: 8px 0;
                        text-align: center;
                        word-break: break-word;
                        font-weight: bold;
                        text-decoration: underline;
                        `;
                        option.onmouseover = () => {
                            option.style.background = '#848f9e4d';
                        };
                        option.onmouseout = () => {
                            option.style.background = '#efefef';
                        };
                        cardOptionsContainer.appendChild(option);
                        break;
                    }
                }
            });
            cardOptions.appendChild(cardOptionsContainer);
            return cardOptions;
        };
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('sm-choice-card-container');
        cardContainer.appendChild(buildCardQuestionElm(content));
        if (imageUrl) {
            cardContainer.appendChild(buildCardImageElement(imageUrl));
        }
        cardContainer.appendChild(buildCardOptions(buttons));
        return cardContainer;
    }

    function createImageElement(metadata) {
        const element = document.createElement('div');
        element.innerHTML = `
        <img
        src=${metadata.image_url}
        alt=${metadata.alt_text}
        />
        `;
        return element;
    }

	function createBulletsCard(bullets, content) {
    // Create the main container div
    const cardContainer = document.createElement('div');
    cardContainer.style.border = '2px solid #4b90e4';
    cardContainer.style.borderRadius = '8px';
    cardContainer.style.padding = '10px';

    // Create the content paragraph
    const contentParagraph = document.createElement('p');
    contentParagraph.textContent = content;
    cardContainer.appendChild(contentParagraph);

    // Create a container div for the bullets
    const bulletsContainer = document.createElement('div');

    // Create the unordered list to contain the bullets
    const bulletsList = document.createElement('ul');
    bullets.forEach(bullet => {
        // Create list item for each bullet
        const bulletItem = document.createElement('li');
        bulletItem.textContent = bullet;
        bulletsList.appendChild(bulletItem);
    });

    // Append the bullets list to the bullets container
    bulletsContainer.appendChild(bulletsList);

    // Append the bullets container to the card container
    cardContainer.appendChild(bulletsContainer);

    return cardContainer;
}


}
