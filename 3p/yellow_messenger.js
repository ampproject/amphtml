/**
 * Create DOM element for the Ymchatbot plugin:
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */

function getContainerScript(global, scriptSource) {
    loadScript(global, scriptSource);
}

function getChatBotWidget(global, data) {
    const container = global.document.createElement('div');
    container.setAttribute('bot-id', data.botId);
    return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yellow_messenger(global, data) {
    console.log("RUNNNNNNNNN");    
    let container;
    container = getChatBotWidget(global, data);
    global.document.getElementById('c').appendChild(container);
    const scriptSource = 'https://app.yellowmessenger.com/api/ml/prediction?bot=' + data.botId +'&text=hi&language=en';
    getContainerScript(global, scriptSource);
}