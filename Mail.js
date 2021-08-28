const MailListener = require("mail-listener2")

// TODO: implement statistics (how much quota used and how many email aliases there are available)
// TODO: consider deleting every message after they are resent to telegram
// TODO: better message layout
// IDEA: consider similar look when message has been forwarded

const listenEmail = (imapUser, imapPassword, imapHost, newEmailCallback, userId) => {
    mailListener = new MailListener({
        username: imapUser,
        password: imapPassword,
        host: imapHost,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        mailbox: "INBOX", // mailbox to monitor
        searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
        markSeen: true, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
        mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
        attachments: false, // download attachments as they are encountered to the project directory
    })
    
    mailListener.start();
    
    mailListener.on("server:connected", () => {
        console.log("Monitoring email...")
    });
    
    mailListener.on("server:disconnected", function(){
        console.log("Email server disconnected...")
    });
    
    mailListener.on("error", (err) => {
        console.log(err)
    });
    
    mailListener.on("mail", function(mail, seqno, attributes){
        console.log("Received new mail!")
        newEmailCallback(userId, mail)
    })
}

module.exports = listenEmail