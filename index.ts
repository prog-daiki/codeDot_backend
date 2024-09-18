const server = Bun.serve({
  port: 8000,
  hostname: "0.0.0.0",
  fetch: (req) => {
    return new Response("Hello via Bun!");
  },
});

console.log("server running", server.port);
