export function contains<T>(arr: T[], obj: T) : boolean {
    return arr.indexOf(obj) > -1;
}

// all insert and remove functions modify the original array

export function remove<T>(arr: T[], obj: T): number {
    const index = arr.indexOf(obj);
    arr.splice(index, 1);
    return index;
}

export function insert<T>(arr: T[], obj: T, index: number): void {
    arr.splice(index, 0, obj);
}

export function removeAt<T>(arr: T[], index: number): T {
    return arr.splice(index, 1)[0];
}

export function removeManyAt<T>(arr: T[], indices: number[]): T[] {
    const removed: T[] = indices.map(i => arr[i]);
    const currentIndices = [...indices];
    for (let i = 0; i < indices.length; i++) {
        const maxIndex = Math.max(...currentIndices);
        remove(currentIndices, maxIndex);
        removeAt(arr, maxIndex);
    }
    return removed;
}

export function insertMany<T>(arr: T[], objs: T[], indices: number[]): void {
    const currentIndices = [...indices];
    for (let i = 0; i < indices.length; i++) {
        const minIndex = Math.min(...currentIndices);
        const index = remove(currentIndices, minIndex);
        insert(arr, removeAt(objs, index), minIndex);
    }
}