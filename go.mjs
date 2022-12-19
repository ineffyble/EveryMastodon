import { readdirSync, writeFileSync } from 'fs';

const done = readdirSync('done');

const joinres = await fetch('https://api.joinmastodon.org/servers');
const joindata = await joinres.json();

let tweeted = false;

for (let instance of joindata) {
    if (!done.includes(instance.domain)) {
                try {
            const tweet = `https://mastoredirect.netlify.app/${instance.domain} ${instance.description.replace(instance.domain, '').replace(instance.domain, '')}`;
            await fetch(`https://maker.ifttt.com/trigger/make_tweet_happen/with/key/${process.env.IFTTT_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value1: tweet })
                });
                console.log(`Tweeted for ${instance.domain}`);
                tweeted = true;

        } catch (err) {
            console.log(err);
            console.log(`Error trying to tweet for ${instance.domain}`);
        }
        writeFileSync(`done/${instance.domain}`, instance.domain);
        break;
    }
}

if (tweeted) {
    process.exit();
}



const res = await fetch(`https://instances.social/api/1.0/instances/list?count=1800&include_down=false&include_closed=false&sort_by=active_users&sort_order=desc`, {
    headers: {
        Authorization: `Bearer ${process.env.INSTANCES_SOCIAL_API_KEY}`
    }
});

const data = await res.json();
const tweets = [];
for (let instance of data.instances) {
    if (!done.includes(instance.name)) {
        try {
            const req = await fetch(`https://${instance.name}/api/v1/instance`);
            const info = await req.json();
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
