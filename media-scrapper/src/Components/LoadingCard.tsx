import React from 'react'
import { 
    Paper, 
    Box, 
    Typography, 
    Stack,
    LinearProgress
} from '@mui/material'

interface LoadingCardProps {
    text: string
}

export function LoadingCard(props: LoadingCardProps) {
    return (
        <Box sx={{ flexGrow: 1 }} paddingTop={1.5}>
            <Paper>
              <Stack spacing={1}>
                <img width={70} src="/ed-smiley.png" alt="image" style={{ alignSelf: 'center' }} />
                <Typography variant='subtitle2' style={{ alignSelf: 'center' }}>
                  {props.text}
                </Typography>
                <LinearProgress variant='indeterminate' />
              </Stack>
            </Paper>
        </Box>
    )
}
