export type Section = {
    number: number;
    title: string;
    content: string;
};

export type BragDoc = {
    filename: string;
    title: string;
    name: string;
    role: string;
    period: string;
    sections: Section[];
};

export type DocMeta = {
    filename: string;
    name: string;
    role: string;
    period: string;
};
