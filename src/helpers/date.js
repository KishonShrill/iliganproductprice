export const mongoDateToText = (dateStr) => {
    const date = new Date(dateStr)
    const options = { month: "short", day: "numeric", year: "numeric" }
    return date.toLocaleDateString("en-US", options)
}
