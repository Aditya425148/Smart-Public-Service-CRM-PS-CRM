
import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69aae8c7003dd9d0e0d6');

const account = new Account(client);

async function check() {
    try {
        const user = await account.get();
        console.log('LOGGED_IN_USER:', JSON.stringify(user, null, 2));
    } catch (e) {
        console.log('NOT_LOGGED_IN');
    }
}

check();
