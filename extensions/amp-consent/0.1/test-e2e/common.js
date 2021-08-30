let ui1;
let ui2;
let postPromptUi;
let tillResponded;
let accepted;
let autoReject;
let defaultBlock;
let notBlocked;
let twitter;

export function resetAllElements() {
  ui1 = undefined;
  ui2 = undefined;
  postPromptUi = undefined;
  tillResponded = undefined;
  accepted = undefined;
  autoReject = undefined;
  defaultBlock = undefined;
  notBlocked = undefined;
  twitter = undefined;
}

export async function findElements(controller) {
  ui1 = await controller.findElement('#ui1');
  ui2 = await controller.findElement('#ui2');
  postPromptUi = await controller.findElement('#postPromptUI');
  tillResponded = await controller.findElement(
    '[data-block-on-consent="_till_responded"]'
  );
  accepted = await controller.findElement(
    '[data-block-on-consent="_till_accepted"]'
  );
  autoReject = await controller.findElement(
    '[data-block-on-consent="_auto_reject"]'
  );
  defaultBlock = await controller.findElement(
    '[data-block-on-consent="default"]'
  );
  notBlocked = await controller.findElement(
    '[src="/examples/img/ima-poster.png"]'
  );
  twitter = await controller.findElement('[data-tweetid="885634330868850689"]');
}

export async function verifyElementsBuilt(controller, builtMap) {
  const elementsMap = {
    'tillResponded': tillResponded,
    'accepted': accepted,
    'autoReject': autoReject,
    'defaultBlock': defaultBlock,
    'notBlocked': notBlocked,
    'twitter': twitter,
  };

  await expect(builtMap.length).to.equal(elementsMap.length);
  const elementIds = Object.keys(elementsMap);

  for (let i = 0; i < elementIds.length; i++) {
    const elementId = elementIds[i];
    const element = elementsMap[elementId];
    const shouldBeBuilt = builtMap[elementId];

    if (shouldBeBuilt) {
      // Should be visible
      await expect(
        controller.getElementAttribute(element, 'class')
      ).to.not.match(/amp-notbuilt/);
    } else {
      // Should not be visible
      await expect(controller.getElementAttribute(element, 'class')).to.match(
        /amp-notbuilt/
      );
    }
  }
}

export async function verifyPromptsHidden(controller, hiddenMap) {
  const elementsMap = {
    'ui1': ui1,
    'ui2': ui2,
    'postPromptUi': postPromptUi,
  };

  await expect(hiddenMap.length).to.equal(elementsMap.length);
  const elementIds = Object.keys(elementsMap);

  for (let i = 0; i < elementIds.length; i++) {
    const elementId = elementIds[i];
    const element = elementsMap[elementId];
    const shouldBeHidden = hiddenMap[elementId];

    if (shouldBeHidden) {
      // Should be hidden
      await expect(controller.getElementProperty(element, 'hidden')).to.be.true;
    } else {
      // Should not be hidden
      await expect(controller.getElementProperty(element, 'hidden')).to.be
        .false;
    }
  }
}
