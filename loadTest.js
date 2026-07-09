import http from 'k6/http';
import { check } from 'k6';
import { Counter } from "k6/metrics";

const allowed = new Counter("allowed");
const denied = new Counter("denied");

export const options = {
    vus: 50,
    duration: '1m',
}

const clients = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

export default function () {
    const clientKey = clients[Math.floor(Math.random() * clients.length)];
    const res = http.post(
        "http://localhost:3000/check",
        JSON.stringify({ clientKey: clientKey }),
        { headers: { 'Content-Type': 'application/json' } }
    )
    if (res.status === 200) {
        allowed.add(1);
    } else if (res.status === 429) {
        denied.add(1);
    }
    check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });
}