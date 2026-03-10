const config = {
  BACKEND_URL:
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "https://eight5giftsvendors-be.onrender.com",
}

export { config }
