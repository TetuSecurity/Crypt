export interface INode {
    ID: number;
    FileID?: string;
    Name: string;
    Size?: number;
    Parent: number;
    CreatedDT: Date;
    ModifiedDT: Date;
    IsDirectory: boolean;
}

export class File implements INode {
    ID: number;
    FileID: string;
    Name: string;
    Size: number;
    Parent: number;
    CreatedDT: Date;
    ModifiedDT: Date;
    IsDirectory: boolean = false;
}

export class Directory implements INode {
    ID: number;
    Name: string;
    Parent: number;
    CreatedDT: Date;
    ModifiedDT: Date;
    IsDirectory: boolean = true;
}

export class SortConfig {
    Field?: string;
    ASC?: boolean = true;
}
