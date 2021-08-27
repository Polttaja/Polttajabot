require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api') 

const MailCow = require('./MailCow')
const Database = require('./Database')

const token = process.env.TG_TOKEN 
const aliasDomain = process.env.ALIAS_DOMAIN

const bot = new TelegramBot(token, {polling: true}) 

const mc = new MailCow(process.env.MC_DOMAIN, process.env.MC_TOKEN)

// Database is needed to know the registered users and their chats
const databaseLocation = process.env.DATABASE

const database = new Database(databaseLocation) 

const messages = {
    "welcome": `📧 Uusi sähköposti on rekisteröity!`,
    "addAlias": `🤡 Uusi alias on luotu!`
}

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id 
    const userId = msg.from.id

    const mailUsername = msg.from.username.toLocaleLowerCase()
    const mailPassword = (Math.random() + 1).toString(36).substring(7) 

    database.addUser(userId, mailUsername, mailPassword)
    database.save()

    mailbox = {
        "active": "1",
        "domain": aliasDomain,
        "local_part": mailUsername,
        "name": `${msg.from.first_name} ${msg.from.last_name}`,
        "password": mailPassword,
        "password2": mailPassword,
        "quota": "5",
        "force_pw_update": "0",
        "tls_enforce_in": "1",
        "tls_enforce_out": "1"
    }

    console.log("Created new mailbox!")

    await mc.addMailbox(mailbox)
    bot.sendMessage(chatId, messages.welcome) 
}) 

bot.onText(/\/alias (.+)/, async (msg, match) => {
    const chatId = msg.chat.id 
    const userId = msg.from.id

    const localPart = match[1]
    const mailMainUsername = database.getUser(userId)
    
    database.addAlias(userId, localPart)
    database.save()

    alias = {
        "active": "1",
        "address": `${localPart}@${aliasDomain}`,
        "goto": `${mailMainUsername}@${aliasDomain}`
    }

    console.log("Added new alias!")

    await mc.addAlias(alias)
    bot.sendMessage(chatId, messages.addAlias + `\n\n${alias.address} -> ${alias.goto}`)
}) 

bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id 
    const userId = msg.from.id

    const mailMainUsername = database.getUser(userId)
    
    const emailAliases = database.getAlias(userId) 

    let userList = `Sähköpostialiaksesi:\n\n`

    emailAliases.forEach(alias => {
        userList += `${alias}@${aliasDomain} -> ${mailMainUsername}@${aliasDomain}\n`
    })

    userList += `\nyht. ${emailAliases.length}`

    bot.sendMessage(chatId, userList)
})


bot.onText(/\/delete (.+)/, async (msg, match) => {
    const chatId = msg.chat.id 
    const userId = msg.from.id

    deleteAlias = match[1]

    const mailMainUsername = database.getUser(userId)
    
    allUsers = await mc.listAlias()
    emailAliases = allUsers.filter(email => email.domain == aliasDomain && email.goto == `${mailMainUsername}@${aliasDomain}`)

    const deleteAliasId = emailAliases.find(alias => alias.address == `${deleteAlias}@${aliasDomain}`)?.id

    const userOwnsAlias = database.getAlias(userId).filter(alias => alias == deleteAlias).length > 0

    if (deleteAliasId && userOwnsAlias) {
        alias = [deleteAliasId]

        mc.deleteAlias(alias)

        database.deleteAlias(userId, deleteAlias)
        database.save()

        bot.sendMessage(chatId, "🔥 Poltettu alias")
    } else {
        bot.sendMessage(chatId, "🚫🔍 Ei löytynyt")
    }
})

// TODO: implement statistics (how much quota used and how many email aliases there are available)
// TODO: consider deleting every message after they are resent to telegram
// TODO: better message layout

