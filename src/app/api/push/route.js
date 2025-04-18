import { NextResponse } from "next/server";
import webpush from "@/lib/WebpushClient";
import { faker } from '@faker-js/faker';

const subscriptions = [];

export async function POST(req) {
    const subscription = await req.json();
    subscriptions.push(subscription);
    return NextResponse.json({ message: "Subscribed successfully!" });
}

const foodMessages = [
    "Your biryani is calling 🍛",
    "Craving something spicy? 🌶️",
    "Dosa just dropped hot 🔥",
    "Midnight munchies? Tap now 🍟",
    "Your pizza misses you 🍕",
    "Something delicious is waiting for you 😋",
    "Tandoori treats in your area 🍗",
    "Order now, thank us later 😉",
    "Feeling snacky? Let's fix that 🥪",
    "You’ve got great taste 😍 (Order it)"
];

function getRandomPushContent() {
    return {
        title: faker.company.name(), // e.g., "Tandoori Express Inc"
        body: foodMessages[Math.floor(Math.random() * foodMessages.length)],
        icon: faker.image.urlPicsumPhotos({ width: 128, height: 128, category: 'food' }) || "https://via.placeholder.com/128",
        data: {
            url: faker.internet.url()
        }
    };
}

export async function GET() {
    const payload = JSON.stringify(getRandomPushContent());

    try {
        await Promise.all(
            subscriptions.map(sub =>
                webpush.sendNotification(sub, payload)
            )
        );
        return NextResponse.json({ message: "Notifications sent" });
    } catch (err) {
        return NextResponse.json({ message: "Error sending notification", error: err });
    }
}
