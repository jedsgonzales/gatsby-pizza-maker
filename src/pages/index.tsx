import React, { useState, useEffect } from "react"
import gql from "graphql-tag";
import { useQuery } from '@apollo/react-hooks';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { FormLabel, Paper, List, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';


import Layout from "../components/layout";
import ToppingImage from "../components/topping";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toppingsGrid: {
      maxHeight: '600px',
      overflowY: 'auto'
    },
    toppings: {
      width: '300px',
      height: '300px',
      '&:hover': {
        background: "#efefef",
      }
    },

    selectedToppings: {
      width: '300px',
      height: '300px',
      background: "#ededed",
    },

    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }),
);

interface Topping {
  name: string; 
  id: string; 
  image: string;
}

interface State {
  stepNo: number;
  cost: number;
  errorStep: string | null;
  ingredients: {
    [key: string]: boolean;
  },
  pizza: {
    size: {
      id: string;
      name: string;
      price: number;
      maxIngredients: number;
    },
    crust: {
      id: string;
      name: string;
      price: number;
    },
    ingredients: Array<Topping>
  }
}

const IndexPage = () => {
  //API call for available pizza sizes
  const pizzaSizes = useQuery(
    gql`
    query availableSizes {
      allSizesJson {
        nodes {
          id
          name
          price
          maxIngredients
        }
      }
    }
  `);

  //API call for available pizza crusts
  const crustTypes = useQuery(
    gql`
    query crustTypes {
      allThicknessJson {
        nodes {
          id
          name
          price
        }
      }
    }
  `);

  //API call for available pizza crusts
  const availableToppings = useQuery(
    gql`
    query pizzaToppings {
      allToppingsJson {
        nodes {
          image
          name
          id
        }
      }
    }
  `);

  const classes = useStyles();

  const [stepNo, setStepNo] = useState<State['stepNo']>(0);
  const [cost, setCost] = useState<State['cost']>(0);
  const [errorStep, setErrorStep] = useState<State['errorStep']>(null);
  const [pizzaSize, setPizzaSize] = useState<State['pizza']['size']>({ id: '', name: 'small', price: 0, maxIngredients: 5 });
  const [pizzaCrust, setPizzaCrust] = useState<State['pizza']['crust']>({ id: '', name: 'small', price: 0 });
  const [pizzaIngredients, setPizzaIngredients] = useState<State['pizza']['ingredients']>([]);
  const [ingredients, setIngredients] = useState<State['ingredients']>({});

  const steps = [
    'Select Size',
    'Crust Type',
    'Pick Ingredients',
    'Your Pizza',
  ];

  const stepErrorMsg = [
    'Please select pizza size before proceeding.',
    null,
    null,
    null
  ];

  const selectPizzaSize = (evt:React.ChangeEvent<HTMLInputElement>, val:string) => {
    for(let sizeData of pizzaSizes.data.allSizesJson.nodes){
      if(sizeData.id == val){
        setPizzaSize({ ...sizeData });
        break;
      }
    }
  }

  const selectPizzaCrust = (evt:React.ChangeEvent<HTMLInputElement>, val:string) => {
    for(let crustData of crustTypes.data.allThicknessJson.nodes){
      if(crustData.id == val){
        setPizzaCrust({ ...crustData });
        break;
      }
    }
  }

  const selectPizzaTopping = (id:string) => {
    let ingredientSelection = { ...ingredients }
    ingredientSelection[id] = !ingredientSelection[id];

    let totalToppings:number = 0;
    Object.keys(ingredientSelection).forEach((key:string ) => {
      if(ingredientSelection[key] === true)
        totalToppings++;
    });

    //console.log("totalToppings ", totalToppings);

    //check toppings limit
    if(totalToppings <= pizzaSize.maxIngredients){
      let choiceOfToppings = availableToppings.data.allToppingsJson.nodes.filter((topping:Topping) => (
        ingredientSelection[topping.id]
      ));

      setPizzaIngredients(choiceOfToppings);

      setIngredients(ingredientSelection);
    }
  }

  const handleBack = () => {
    if(stepNo > 0){
      setStepNo((stepNo) => stepNo - 1);
    }
  }

  const handleNext = () => {
    //validate current step
    if(stepNo === 0){
      if(pizzaSize.id === ''){
        setErrorStep(stepErrorMsg[stepNo]);
        return;
      }
    }

    if(stepNo < steps.length - 1){
      setStepNo((stepNo) => stepNo + 1);
      calculateCost();
    } else {
      resetOrder();
      setStepNo(0);
    }
  }

  const calculateCost = () => {
    let totalCost:number = 0;

    if(pizzaSize.id !== '')
      totalCost += pizzaSize.price

    if(pizzaCrust.id !== '')
      totalCost += pizzaCrust.price

    totalCost += pizzaIngredients.length > 3 ? (pizzaIngredients.length - 3) * 0.5 : 0;

    setCost(totalCost);
  }

  const resetOrder = () => {
    let ingredientSelection = { ...ingredients }

    Object.keys(ingredientSelection).forEach((key:string ) => {
      ingredientSelection[key] = false;
    });

    setIngredients(ingredientSelection);
    setPizzaCrust(crustTypes.data.allThicknessJson.nodes[0]);
    setPizzaIngredients([]);
    setCost(0);
  }

  useEffect(() => {
    if(!crustTypes.loading && !crustTypes.error && pizzaCrust.id === '') {
      setPizzaCrust(crustTypes.data.allThicknessJson.nodes[0]);
    }
  }, [crustTypes]);

  useEffect(() => {
    if(!availableToppings.loading && !availableToppings.error && Object.keys(ingredients).length === 0) {
      let ingredientSelection:{ [key:string]:boolean } = {};
      availableToppings.data?.allToppingsJson.nodes.forEach((ingredient:Topping) => {
        ingredientSelection[ingredient.id] = false;
      });

      setIngredients(ingredientSelection);
    }
  }, [availableToppings, setIngredients]);

  return (
    <Layout>
      <Modal className={classes.modal}
        open={errorStep !== null}
        onClose={() => {
          setErrorStep(null);
        }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Card className={classes.paper}>
          <CardContent>
            {errorStep}
          </CardContent>
        </Card>
      </Modal>
      <Stepper activeStep={stepNo}>
        {steps.map((label, index) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Grid container>
        <Grid item xs={12}>&nbsp;</Grid>

        <Grid container>
          <Grid hidden={stepNo !== 0} item xs={9}>
            {
              pizzaSizes.loading ? <CircularProgress /> :
                ( pizzaSizes.error ? 'Failed' : (
                  <FormControl component="fieldset">
                    <FormLabel component="legend"><h1>Select Pizza Size</h1></FormLabel>
                    <RadioGroup aria-label="size" name="pizzaSize" value={pizzaSize.id} onChange={selectPizzaSize}>
                      {
                        pizzaSizes.data.allSizesJson.nodes.map((sizeData:State['pizza']['size']) => (
                          <FormControlLabel value={sizeData.id} control={<Radio />} label={`${sizeData.name} (${sizeData.price}$)`} />
                        ))
                      }
                    </RadioGroup>
                  </FormControl>
                ))
            }
          </Grid>

          <Grid hidden={stepNo !== 1} item xs={9}>
            {
              crustTypes.loading ? <CircularProgress /> :
                ( crustTypes.error ? 'Failed' : (
                  <FormControl component="fieldset">
                    <FormLabel component="legend"><h1>Select Crust</h1></FormLabel>
                    <RadioGroup aria-label="crust" name="pizzaCrust" value={pizzaCrust.id} onChange={selectPizzaCrust}>
                      {
                        crustTypes.data.allThicknessJson.nodes.map((crustData:State['pizza']['crust']) => (
                          <FormControlLabel value={crustData.id} control={<Radio />} label={`${crustData.name} (+${crustData.price}$)`} />
                        ))
                      }
                    </RadioGroup>
                  </FormControl>
                ))
            }
          </Grid>

          <Grid hidden={stepNo !== 2} item xs={9}>
            {
              availableToppings.loading ? <CircularProgress /> :
                ( availableToppings.error ? 'Failed' : (
                  <>
                    <h1>Additional Toppings</h1>
                    <Grid container justify="center" spacing={2} className={classes.toppingsGrid}>
                    {
                      availableToppings.data.allToppingsJson.nodes.map((topping:Topping) => (
                        <Grid key={topping.id} item>
                          <Paper className={ingredients[topping.id] ? classes.selectedToppings : classes.toppings} elevation={ingredients[topping.id] ? 20 : 1} onClick={() => {
                            selectPizzaTopping(topping.id)
                          }}>
                            <div style={{marginLeft: '10px'}}>{topping.name}</div>
                            <ToppingImage filepath={`toppings/${topping.image}`} />
                          </Paper>
                        </Grid>
                      ))
                    }
                    </Grid>
                  </>
                ))
            }
          </Grid>

          <Grid hidden={stepNo !== 3} item xs={9}>
            {
              availableToppings.loading ? <CircularProgress /> :
                ( availableToppings.error ? 'Failed' : (
                  <Card>
                    <CardContent>
                      <Typography variant="h4" component="h2">
                        {`${pizzaCrust.name} crust ${pizzaSize.name} sized pizza`}
                      </Typography>
                      <Typography color="textSecondary">
                        &nbsp;
                      </Typography>
                      <Typography variant="body2" component="p">
                        <List>
                        {
                          pizzaIngredients.map((topping:Topping, n:number) => (
                            <ListItem>
                              <ListItemIcon>
                                <AddIcon />
                              </ListItemIcon>
                              <ListItemText primary={`${topping.name}${n > 2 ? " (+ 0.5$)" : ""}`} />
                            </ListItem>
                          ))
                        }
                        </List>
                      </Typography>
                    </CardContent>
                    <CardActions>
                      
                    </CardActions>
                  </Card>
                ))
            }
          </Grid>

          <Grid item xs={3} style={{
            textAlign: 'center',
            padding: '70px 0'
          }}>
            <h1>Total</h1>
            <h1>${cost}</h1>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>&nbsp;</Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained"
            color="secondary"
            disabled={stepNo === 0} onClick={handleBack}>
            Back
          </Button>{' '}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {stepNo === steps.length - 2 ? 'Finish' : (stepNo === steps.length - 1 ? 'Restart' : 'Next') }
          </Button>
        </Grid>
        <Grid item xs={12}>&nbsp;</Grid>
      </Grid>
    </Layout>
  )
}

export default IndexPage
