export function createRoomId(id: string, partnerId: string) {
    return [id, partnerId].sort().join("");
}