const dataSchema = {
  participants: ['string'], // TODO: validateJson does not test lists of types
  contacts: [{name: 'string', email: 'string'}],
  state: [
    {
      name: 'string',
      stats: {
        recipients: [{name: 'string', weight: 'number', frequency: 'number'}],
        meanRecipientWeight: 'number',
        recipientRepeatFrequency: 'number',
        previousRecipient: 'string',
      },
    },
  ],
};

/** Dry run by default */
function secretSanta({dryRun = true}) {
  const storage = {
    // <https://drive.google.com/file/d/12Bl7_xOK0i8Gb--qafgJ-fwMs1NnHIvg/view>
    file: DriveApp.getFileById('12Bl7_xOK0i8Gb--qafgJ-fwMs1NnHIvg'),
    // <https://drive.google.com/file/d/16zWQCV5qcXmjK_hl5b9by0d7hTznkV3y/view>
    backup: DriveApp.getFileById('16zWQCV5qcXmjK_hl5b9by0d7hTznkV3y'),
  };

  const dataAsString = storage.file.getBlob().getDataAsString(); // needed later for backup
  const data = JSON.parse(dataAsString);

  validateJson(data, dataSchema);

  const secretSanta = new SecretSanta(data.state);

  for (const name of data.participants) secretSanta.addParticipant(name);

  const santaPairs = secretSanta.draw();

  // Verify pairings
  const recipients = new Set();
  for (let i = 0; i < santaPairs.length; i++) {
    const pair = santaPairs[i];
    if (recipients.has(pair.recipient)) {
      throw new Error('Duplicate recipients found in Secret Santa pairs. Emails will not be sent.');
    } else if (pair.name == pair.recipient) {
      throw new Error('Pair name matches recipient name in Secret Santa pairs. Emails will not be sent.');
    } else {
      recipients.add(pair.recipient);
    }
  }

  const nextState = secretSanta.toJSON();
  validateJson(nextState, dataSchema.state);
  data.state = nextState;

  if (dryRun) {
    console.log(`backup: ${dataAsString}`);
    console.log(`file: ${JSON.stringify(data)}`);

    console.log(JSON.stringify(santaPairs));

    return;
  }

  storage.backup.setContent(dataAsString);
  storage.file.setContent(JSON.stringify(data));

  // Send participant emails
  const nameToEmail = new Map();
  for (const contact of data.contacts) nameToEmail.set(contact.name, contact.email);

  const date = new Date();
  santaPairs.forEach(pair => {
    let email = nameToEmail.get(pair.name);
    console.info(`🎄 Start processing ${pair.name}. Email: ${email}.`);
    MailApp.sendEmail({
      to: email,
      subject: `Secret Santa ${date.getFullYear()} results for ${pair.name}`,
      htmlBody: `
              <p style="display:none; font-size:0; color:#ffffff; line-height:0; max-height:0; max-width:0; opacity:0; overflow:hidden;">🎄 Open this email to find out who you have for Secret Santa this year! Maybe buy them some tasty dark chocolate?</p>
              <p>Hello ${pair.name},</p>
              <p>You have ${pair.recipient} for Secret Santa this year!</p>
              `,
    });
    console.info(`🎄 Done processing ${pair.name}. Email: ${email}.`);
  });
}

/**
 *
 * @function
 * @description Yearly function runs automagically ✨ every year ... at some point
 */
function year() {
  secretSanta({dryRun: false});
}

function dryRun() {
  secretSanta({dryRun: true});
}
