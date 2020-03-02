import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import withStyles from '@material-ui/core/styles/withStyles'
import PropTypes from 'prop-types'
import ky from 'ky'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'


const styles = {
    form: {
        textAlign: 'center'
    },
    textField: {
        marginHorizontal: 5
    },
    pageTitle: {
        margin: '10px auto'
    },
    button: {
        margin: '10px auto',
        position: 'relative'
    },
    customError: {
        color: 'red',
        fontSize: '0.8rem',
        margin: '5px auto'
    },
    progress: {
        
    }

}

class Login extends Component{
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            loading: false,
            errors: {}
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault()
        const { email, password } = this.state
        if (!email || !password) {
            if (!email) {
                this.setState({

                })
            }
            return false;
        }
        this.setState({
            loading: true
        })
        try {
            let loginResponse = await ky.post('/login', {
                body: JSON.stringify({email,password})
            }).json()
            console.log(loginResponse)
            this.setState({
                loading: false
            })
            this.props.history.push('/')
        } catch (loginError) {
            try {
                let loginErrorJSON = await loginError.response.json()
                this.setState({
                    errors: loginErrorJSON,
                    loading: false
                })
            } catch (err) {
                console.log({loginError: err})
            }
        }
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    render() {
    const { classes } = this.props
    const { email, password, errors, loading } = this.state
        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <Typography variant="h2" className={classes.pageTitle}>
                        Login
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField id="email" name="email" type="email" label="E-mail" 
                        className={classes.textField} value={email} onChange={this.handleChange}
                        helperText={errors.email} 
                        error={errors.email ? true : false}
                        fullWidth/>

                        <TextField id="password" name="password" type="password" label="Password" 
                        className={classes.textField} value={password} 
                        helperText={errors.password}
                        error={errors.password ? true : false}
                        onChange={this.handleChange} 
                        fullWidth/>
                        {errors.general ? (
                            <Typography variant="body2" className={classes.customError}>
                                {errors.general}
                            </Typography>
                        ) : null}
                        <Button type="submit" variant="contained" color="primary" className={classes.button} disabled={loading}>
                            {!loading ? (
                                <span>Login</span>
                            ) : (
                            <CircularProgress color="primary.light" className={classes.progress} />
                            )}
                        </Button><br/>
                        <Link color="inherit" to="/signup">Create an Account</Link>
                    </form>

                </Grid>
                <Grid item sm />
            </Grid>
        )
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Login)