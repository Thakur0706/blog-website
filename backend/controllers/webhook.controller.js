const { userModel } = require("../models/userModel");
const { Webhook } = require("svix");

// =======================
//        task
// =======================
//=> task to do the same for post deleted etc

const ClerkWebhook = async(req,res)=>{
    const WEBHOOK_SCRET = process.env.CLERK_WEBHOOK_SECRET

    if(!WEBHOOK_SCRET){
        throw new Error("Webhook secret needed")
    }

    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(WEBHOOK_SCRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
        return;
    }

    if(evt.type === 'user.created'){
        const newUser = new userModel({
            clerkId: evt.data.id,
            username: evt.data.username || evt.data.email_addresses[0].email_address,
            email:evt.data.email_addresses[0].email_address,
            img:evt.data.profile_image_url
        })

        await newUser.save()
    }

    res.status(200).json({ message: "Webhook received successfully" });

}

module.exports = {
    ClerkWebhook
}