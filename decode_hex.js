const hex = "0000000000000000416273656e636500000000000002ffff790d001186321007ea02030d00080001000100009f58"; // Taken from log tail

// Try to find the Codec ID and Count
// The snippet seems to be a Codec 12 response or similar?
// "416273656e6365" is "Absence" in ASCII (41=A, 62=b, 73=s, 65=e, 6e=n, 63=c, 65=e)
// So this is the response to the "Absence" event.

console.log("Decoding Raw Hex Snippet:");
console.log(hex);

if (hex.includes("416273656e6365")) {
    console.log("FOUND: 'Absence' text string in packet.");
}

// Let's decode the timestamp if possible.
// AVL Data usually starts with 00000000 + Data Length + Codec + Count + Timestamp
// This snippet looks like a response or a fragment.

// Let's try to interpret the end of the string
// ...ea02030d00080001000100009f58
// 9f58 is likely CRC.
// 00000001 = Number of Data 1?

console.log("Analysis: This looks like a command response or event fragment containing 'Absence'.");
