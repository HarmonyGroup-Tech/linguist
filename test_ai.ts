
import { splitText } from './src/services/ai';

const testText = `
The Shire was a hobbit-hole, and that means comfort. It had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle. The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and whole lots of pegs for hats and coats - the hobbit was fond of visitors.
`;

async function test() {
    console.log("Testing splitText...");
    try {
        const segments = await splitText(testText);
        console.log("Segments:", segments);
    } catch (e) {
        console.error("Error:", e);
    }
}

// Mocking fetch for node environment since ai.ts uses fetch
// In a real browser environment this isn't needed, but for running via node/ts-node it might be if polyfills aren't present.
// However, since we can't easily run the TS file directly without setup, I will just write the ai.ts changes first.
// This file is actually not useful yet because I need to modify ai.ts first.
// I will rely on the implementation plan and modify ai.ts directly.
