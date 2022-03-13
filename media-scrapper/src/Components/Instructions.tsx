import React from 'react'
import styles from './styles/DivStyle.module.css'
import { Box, Typography, Stack } from '@mui/material'

const divStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    margin: '0 auto',
    transform: 'translate(-25%, -50%)'
}

export function Instructions() {
    return (
        <Box paddingTop={4}>
            <Stack spacing={2.5}>
                <Typography variant='h5' alignSelf={'center'} textAlign={'center'}>
                  Paste the website URL in the text field above and click the <b>SCRAP</b> button to download the attached media.
                </Typography>
                <div className={styles.bottomCenterDiv}>
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
                        <Typography variant={'subtitle2'}>
                            ●
                        </Typography>
                        <Typography variant={'subtitle2'}>
                            m3u8
                        </Typography>
                    </Stack>
                </div>
            </Stack>
        </Box>
    )
}
