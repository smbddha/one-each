export const ip_to_int = (ip: string): number => {
    const octets = ip.split(".").map((s) => Number(s));

    return octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256 + octets[3];
};

export type SuccessOrFailure<T, E = Error> = 
    {ok: true, val: T} |
    {ok: false, err: E}

export const Success = (data: any) => {
    return {
        ok: true,
        val: data,
    };
};

export const Failure = (err: Error) => {
    return {
	ok: false,
        err: err
    };
};
