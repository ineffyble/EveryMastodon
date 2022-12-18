import { readdirSync, writeFileSync } from 'fs';

const res = await fetch(`https://instances.social/api/1.0/instances/list?count=1800&include_down=false&include_closed=false&sort_by=active_users&sort_order=desc`, {
    headers: {
        Authorization: `Bearer ${process.env.INSTANCES_SOCIAL_API_KEY}`
    }
});

const done = readdirSync('done');

const data = await res.json();
const tweets = [];
for (let instance of data.instances) {
    if (!done.includes(instance.name)) {
        try {
            const req = await fetch(`https://${instance.name}/api/v1/instance`);
            const info = req.json();
            console.log(info);
            if (info.short_description) {
                const tweet = `https://mastoredirect.netlify.app/${instance.name} ${info.short_description.replace(instance.name, '').replace(instance.name, '')}`;
                await fetch(`https://maker.ifttt.com/trigger/make_tweet_happen/with/key/${process.env.IFTTT_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value1: tweet })
                });
                console.log(`Tweeted for ${instance.name}`);
            }
        } catch (err) {
            console.log(`Error trying to tweet for ${instance.name}`);
        }
        writeFileSync(`done/${instance.name}`, instance.name);
        break;
    }
}
