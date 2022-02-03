// Choc UI

import React from "react";
import {
  chakra,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";

 const Ma = (props) => {
    const { property, description, size, ...rest } = props;
  return (
      <Box
        w={size}
        mx={2}
        py={4}
        px={4}
        bg={useColorModeValue("white", "gray.800")}
        shadow="lg"
        rounded="lg"
        {...rest}
      >

        <chakra.h2
          color={useColorModeValue("gray.800", "white")}
          fontSize={{ base: "lg", md: "lg" }}
          mt={{ base: 2, md: 0 }}
        >
          {property}
        </chakra.h2>

        <chakra.p fontSize={{ base: "4xl", md: "4xl" }} mt={2} color={useColorModeValue("gray.900", "gray.200")}>
            {description}
        </chakra.p>
      </Box>
  );
};

export default Ma;