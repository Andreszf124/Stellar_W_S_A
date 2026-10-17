import { Buffer } from "buffer"

// No I, O, 0 or 1, which are easy to mix up when typing a code from a label.
// 32 characters, so picking by `byte % 32` has no bias.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** A random one-time code like `K7QM-2XWD-9PTA`. */
export function generateClaimCode() {
	const bytes = crypto.getRandomValues(new Uint8Array(12))
	const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length])
	return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8)]
		.map((group) => group.join(""))
		.join("-")
}

/** Codes are compared without case or spaces, so typing mistakes cost less. */
export const normalizeCode = (code: string) =>
	code.trim().toUpperCase().replace(/\s+/g, "")

/** The bytes the contract receives when a buyer claims an item. */
export const codeBytes = (code: string) =>
	Buffer.from(normalizeCode(code), "utf8")

/** The sha256 of the code: the only thing the store puts on-chain. */
export async function claimHash(code: string) {
	const data = new TextEncoder().encode(normalizeCode(code))
	const digest = await crypto.subtle.digest("SHA-256", data)
	return Buffer.from(digest)
}
