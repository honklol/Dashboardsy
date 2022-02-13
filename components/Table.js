// Choc UI
import React from "react";
import {
  Flex,
  Icon,
  useColorModeValue,
  Button,
  Stack,
  SimpleGrid,
  ButtonGroup,
  IconButton,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,

} from "@chakra-ui/react";
import { AiFillEdit, AiTwotoneLock } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import config from '../config.json'
import Link from 'next/link'



export default function Component(props) {
  const { data, deleteServerFunc, editServerFunc, uinfo, deletionservers, setMemory, setDisk, setCpu, setServerid, renewalservers } = props;
  const rdata = Array.from(data)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isOpenPopover, setIsOpenPopover] = React.useState(false)
  const openPopover = (t) => setIsOpenPopover(t)
  const closePopover = () => setIsOpenPopover(false)
  const onClose = (e) => {
    deleteServerFunc(e)
    setIsOpen(false)
  }
  const initialFocusRef = React.useRef()
  const cancelRef = React.useRef()
  return (
    <Stack
      direction={{ base: "column" }}
      w="full"
      bg={useColorModeValue("white", "gray.800")}
      shadow="lg"
      p="2"
      borderRadius='xl'
    >
      <Text align="center" fontSize='4xl'>Servers</Text>
      {rdata && rdata.length > 0 ? rdata.map((tok, tid) => {
        const second = 1000
        const minute = second * 60
        const hour = minute * 60
        const day = hour * 24
        const token = JSON.parse(tok)
        let serverdeletion, daysdeletion, hoursdeletion, minutesdeletion, timeLeftDeletion, totalTimeLeftDeletion, sdeletion, serverrenew, totalTimeLeft
        if (config.renewal.enabled) {
          sdeletion = deletionservers.find(x => x.serverid == token.id)
          if (sdeletion) {
            serverdeletion = sdeletion.deletiondate
            timeLeftDeletion = serverdeletion - new Date().getTime()
            daysdeletion = Math.floor(timeLeftDeletion / (day)) + " Days"
            hoursdeletion = Math.floor((timeLeftDeletion % (day)) / (hour)) + " Hours"
            minutesdeletion = Math.floor((timeLeftDeletion % (hour)) / (minute)) + " Minutes"
            totalTimeLeftDeletion = `${daysdeletion} ${hoursdeletion} ${minutesdeletion}`
          }
          serverrenew = renewalservers.find(x => x.serverid == token.id).renewaldate
          const timeLeft = serverrenew - new Date().getTime()
          let days = Math.floor(timeLeft / (day)) + " Days",
            hours = Math.floor((timeLeft % (day)) / (hour)) + " Hours",
            minutes = Math.floor((timeLeft % (hour)) / (minute)) + " Minutes"
  
          totalTimeLeft = `${days} ${hours} ${minutes}`
        }
        return (
          <Flex
            direction={{ base: "row", md: "column" }}
            bg={useColorModeValue("white", "gray.800")}
            key={tid}
          >
            <SimpleGrid
              spacingY={3}
              columns={{ base: 1, md: 4 }}
              w="full"
              py={2}
              px={10}
              fontWeight="hairline"
              p="4"
              spacingX={160}
            >
              <span>{token.name}</span>
              {config.renewal.enabled ? serverdeletion ? <span>Server will be deleted in {totalTimeLeftDeletion} if you don't get {config.renewal.costtorenew} coins.</span> : <span>Time left to renew: {totalTimeLeft}</span> : <span>Ram: {token.limits.memory}, CPU: {token.limits.cpu}, Disk: {token.limits.disk}</span>}
              <Flex>
                <Link href={'https://' + config.panel_url + '/server/' + token.identifier}>
                  <a>
                    <Button
                      size="sm"
                      variant="solid"
                      leftIcon={<Icon as={AiTwotoneLock} />}
                      colorScheme="purple"
                    >
                      View Server
                    </Button>
                  </a>
                </Link>
              </Flex>
              <Flex justify={{ md: "end" }}>
                <ButtonGroup variant="solid" size="sm" spacing={3}>
                  <Popover
                    initialFocusRef={initialFocusRef}
                    placement='bottom'
                    closeOnBlur={false}
                    isOpen={isOpenPopover == 'sid' + token.id}
                    onClose={closePopover}
                    onOpen={() => {
                      setServerid(token.id)
                      setMemory(token.limits.memory)
                      setCpu(token.limits.cpu)
                      setDisk(token.limits.disk)
                      uinfo.unused.cpu = uinfo.unused.cpu + token.limits.cpu
                      uinfo.unused.memory = uinfo.unused.memory + token.limits.memory
                      uinfo.unused.disk = uinfo.unused.disk + token.limits.disk
                    }}
                    id={'sid' + token.id}
                  >
                    <PopoverTrigger>
                      <IconButton colorScheme="green" icon={<AiFillEdit />} onClick={() => openPopover('sid' + token.id)} />
                    </PopoverTrigger>
                    <PopoverContent color={useColorModeValue("gray.900", "white")} bg={useColorModeValue("white", "gray.600")} borderColor={useColorModeValue("white", "gray.600")}>
                      <PopoverHeader pt={4} fontWeight='bold' border='0'>
                        Edit Server
                      </PopoverHeader>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverBody>
                        <FormControl>
                          <FormLabel htmlFor="memoryinput">Amount of Memory:</FormLabel>
                          <NumberInput step={100} defaultValue={token.limits.memory} min={1} max={uinfo.unused.memory} id="memoryinput" onChange={setMemory}>
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel htmlFor="cpuinput">Amount of CPU:</FormLabel>
                          <NumberInput step={5} defaultValue={token.limits.cpu} min={1} max={uinfo.unused.cpu} id="cpuinput" onChange={setCpu}>
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel htmlFor="diskinput">Amount of Disk:</FormLabel>
                          <NumberInput step={100} defaultValue={token.limits.disk} min={1} max={uinfo.unused.disk} id="diskinput" onChange={setDisk}>
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </PopoverBody>
                      <PopoverFooter
                        border='0'
                        d='flex'
                        alignItems='center'
                        justifyContent='right'
                        pb={4}
                      >
                        <ButtonGroup size='sm'>
                          <Button colorScheme='blue' ref={initialFocusRef} onClick={e => {
                            editServerFunc(e)
                            closePopover()
                          }}>
                            Next
                          </Button>
                        </ButtonGroup>
                      </PopoverFooter>
                    </PopoverContent>
                  </Popover>
                  <IconButton
                    colorScheme="red"
                    variant="outline"
                    icon={<BsFillTrashFill />}
                    onClick={() => {
                      setServerid(token.id)
                      setIsOpen(true)
                    }}
                  />
                  <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setIsOpen(false)}
                  >
                    <AlertDialogOverlay>
                      <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                          Delete Server?
                        </AlertDialogHeader>

                        <AlertDialogBody>
                          Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                          <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                            Cancel
                          </Button>
                          <Button colorScheme='red' onClick={onClose} ml={3}>
                            Delete
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                </ButtonGroup>
              </Flex>
            </SimpleGrid>
          </Flex>
        );
      }) : <Text fontSize="2xl" align="center">No Servers Found</Text>}
    </Stack>
  );
}