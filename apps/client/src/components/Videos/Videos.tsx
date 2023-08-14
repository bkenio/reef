import useSWR from 'swr'
import VideoItem from './VideoItem'

import { Video } from '../../types'
import { Box, VStack } from '@chakra-ui/react'

export default function Videos() {
  const { data, error, isLoading } = useSWR('/videos')

  if (error) return <Box>failed to load</Box>
  if (isLoading) return <Box>loading...</Box>

  return (
    <VStack py="2">
      {data?.map((v: Video) => {
        return <VideoItem key={v.id} video={v} />
      })}
    </VStack>
  )
}
