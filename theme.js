import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false
}

/*
 want custom colors?
 Remove const theme = extendTheme({ config })
 and add
 const theme = extendTheme({ config }, {
    colors: {
        "gray": {
            50: "HEX CODE HERE"
        },
    }
 })

 use https://themera.vercel.app/ to make color schemes.
 */
const theme = extendTheme({ config })

export default theme