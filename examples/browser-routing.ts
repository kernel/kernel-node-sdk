import Kernel from '@onkernel/sdk';

async function main() {
  const kernel = new Kernel({
    browserRouting: {
      enabled: true,
      directToVMSubresources: ['computer'],
    },
  });

  const browser = await kernel.browsers.create({});
  await kernel.browsers.computer.clickMouse(browser.session_id, { x: 10, y: 10 });
  await kernel.browsers.deleteByID(browser.session_id);
}

void main();
