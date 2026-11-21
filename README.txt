CHAI FACTORY  -  website + order backend
==========================================

Isme kya hai
- Cart me add karke Checkout karo -> order server par SAVE hota hai.
- Contact form ke messages bhi save hote hain.
- Admin page:  <aapki-site>/admin   (orders dekho, status badlo: new / preparing / out for delivery / delivered)

ONLINE HOSTING (Render - free)
1. github.com par free account banao -> "New repository" -> naam: chai-factory.
2. "uploading an existing file" par click karke is folder ki SAARI files upload karo
   (index.html, style.css, script.js, package.json, render.yaml, assets, images, server).
3. render.com par free account banao -> New + -> Web Service -> apni GitHub repo chuno.
   Build Command: (khali ya  echo ok)      Start Command: node server/server.js
4. "Environment" me ye daalo:
     NODE_ENV        = production
     ADMIN_PASSWORD  = (apna mazboot password)   <- zaroor badlo!
5. Deploy dabao. Link milega: https://chai-factory-xxxx.onrender.com
   Admin: us link ke aage /admin

IMPORTANT (free hosting ki limit)
- Render ka free plan file save nahi rakhta: server restart/redeploy hone par orders.json mit sakti hai,
  aur 15 min inactive rehne par site so jati hai (pehla khulna ~50 sec leta hai).
- Orders kabhi na khoyen iske liye TELEGRAM alert lagao (free):
    a) Telegram me @BotFather ko /newbot bhejo -> token milega.
    b) Apne bot ko ek message bhejo, phir browser me kholo:
       https://api.telegram.org/bot<TOKEN>/getUpdates   -> "chat":{"id": ...} wo number chat id hai.
    c) Render Environment me daalo: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
  Ab har naya order aur message seedha aapke Telegram par aayega.
- Pakka save chahiye to Render ka paid Disk lo aur DATA_DIR=/var/data set karo.

APNE COMPUTER PAR CHALANA (Node.js chahiye: nodejs.org)
- Windows: start.bat double-click  |  Mac/Linux: ./start.sh
- Browser me kholo: http://localhost:3000   Admin: http://localhost:3000/admin  (password: chai123)

Menu / price badalna: script.js me CHAI, SNACKS, COMBOS ki list badlo. Server khud wahi prices padhta hai,
isliye koi browser me price chhed-chhad karke sasta order nahi de sakta.
