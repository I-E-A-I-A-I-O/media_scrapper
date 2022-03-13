import React from 'react'
import { 
    Paper, 
    Box, 
    Typography, 
    Stack,
    LinearProgress
} from '@mui/material'

export function Instructions() {
    return (
        <Box paddingTop={4}>
            <Stack spacing={2.5}>
                <Typography variant='h5' alignSelf={'center'}>
                  Paste the website URL in the text field above and click the <b>SCRAP</b> button to download the attached media.
                </Typography>
                <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                    <Stack spacing={4} direction={'row'} alignSelf={'center'} >
                        <Typography variant={'subtitle2'}>
                            CNN
                        </Typography>
                        <Typography variant={'subtitle2'}>
                            ●
                        </Typography>
                        <Typography variant={'subtitle2'}>
                            RFI
                        </Typography>
                        <Typography variant={'subtitle2'}>
                            ●
                        </Typography>
                        <Typography variant={'subtitle2'}>
                            Youtube
                        </Typography>
                    </Stack>
                </div>
            </Stack>
        </Box>
    )
}
