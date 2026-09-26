export const POST_TYPES = ["note", "essay", "guide", "link"] as const;
export type PostType = (typeof POST_TYPES)[number];

export function isPostType(value: string): value is PostType {
	return POST_TYPES.some((type) => type === value);
}
