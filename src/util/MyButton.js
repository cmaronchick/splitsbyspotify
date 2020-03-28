import React from 'react'

import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'


export default ({children, onClick, tip, tipPlacement, btnClassName, tipClassName}) => {
    return (
        <Tooltip title={tip} className={tipClassName} placement={tipPlacement}>
            <IconButton onClick={onClick} className={btnClassName}>
                {children}
            </IconButton>
        </Tooltip>
    )
}