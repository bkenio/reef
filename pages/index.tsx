import { Flex, Heading } from '@chakra-ui/react'
import Layout from '../components/Layout/Layout'
import { useRouter } from 'next/router'

export default function Videos() {
  const router = useRouter()

  return (
    <Layout>
      <Flex w="100%" justify="center">
        <Heading
          h="100px"
          pt="12"
          cursor="pointer"
          onClick={() => {
            router.push('/videos')
          }}
        >
          Enter the Alcove
        </Heading>
      </Flex>
    </Layout>
  )
}
