import useLazyRequest from '../../hooks/useLazyRequest'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { IoAddSharp } from 'react-icons/io5'
import {
  Modal,
  Input,
  Button,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  ModalCloseButton,
  IconButton,
} from '@chakra-ui/react'

export default function CreatePod() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [podName, setPodName] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [createPod, { data, loading, error }] = useLazyRequest({
    method: 'POST',
    url: 'http://localhost:4000/pods',
  })

  async function handleSubmit() {
    try {
      await createPod({
        data: { name: podName },
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!error && data && !loading) {
      mutate('http://localhost:4000/pods')
      onClose()
      console.log(data)
      router.push(`/pods/${data?.payload?.pod?.id}`)
    }
  }, [data, loading, error])

  return (
    <>
      <IconButton
        px='2'
        w='100%'
        maxW='60px'
        variant='ghost'
        onClick={onOpen}
        aria-label='create-pod'
        justifyContent='center'
        icon={<IoAddSharp size='24px' />}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Pod</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              autoFocus
              value={podName}
              onChange={e => {
                setPodName(e.target.value)
              }}
              onKeyUp={e => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button isLoading={loading} onClick={handleSubmit} variant='solid' colorScheme='teal'>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
