import('inquirer').then(async inquirerModule => {
  const inquirer = inquirerModule.default;

  const member = await import('./member.js');
  const trainer = await import('./trainer.js');
  const admin = await import('./admin.js');

  const mainMenu = async () => {
    const answer = await inquirer.prompt({
      name: 'role',
      type: 'list',
      message: 'Select your role:',
      choices: ['Member', 'Trainer', 'Admin', 'Exit'],
    });

    switch (answer.role) {
      case 'Member':
        await member.default();
        break;
      case 'Trainer':
        await trainer.default();
        break;
      case 'Admin':
        await admin.default();
        break;
      case 'Exit':
        console.log('Closing the application...');
        return;
    }

    if(answer.role !== 'Exit') {
      await mainMenu();
    }
  };

  mainMenu();
});