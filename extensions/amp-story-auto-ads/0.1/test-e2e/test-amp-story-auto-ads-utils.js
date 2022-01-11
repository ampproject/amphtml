export async function clickThroughPages(controller, numPages) {
  for (let i = 0; i < numPages; i++) {
    const page = await controller.findElement('[active]');
    await controller.click(page);
  }
}

export async function switchToAdFrame(controller) {
  const frame = await controller.findElement('#i-amphtml-ad-page-1 iframe');
  await controller.switchToFrame(frame);
}
