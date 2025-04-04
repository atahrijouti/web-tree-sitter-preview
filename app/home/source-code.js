const sourceCode = `
    // --- Modules ---
    import fs from "fs";
    import { join } from "path";

    // --- Variables & Constants ---
    const PI = 3.1415;
    let counter = 0;

    // --- Arrow Function ---
    const add = (a, b) => a + b;
    console.log(add(2, 3));

    // --- Classes & Inheritance ---
    class Person {
        constructor(name) { this.name = name; }
        greet() { return \`Hello, \${this.name}!\`; }
    }

    class Admin extends Person {
        constructor(name, level) {
            super(name);
            this.level = level;
        }
    }

    console.log(new Admin("Eve", 10).greet());

    // --- Async/Await & Optional Chaining ---
    async function fetchData(url) {
        try {
            const res = await fetch(url);
            return res.ok ? await res.json() : null;
        } catch { return null; }
    }

    const config = { theme: "dark" };
    console.log(config?.theme ?? "light");

    // --- Generators & Symbols ---
    function* idGen() { let id = 1; while (true) yield id++; }
    const uniqueID = Symbol("id");
`;
export {
  sourceCode
};
