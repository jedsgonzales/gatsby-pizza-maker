import React, { useState, useEffect } from "react"
import gql from "graphql-tag"
import { useQuery } from "@apollo/react-hooks"

import {
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  CircularProgress,
  Grid,
  Radio,
  Modal,
  Card,
  CardActions,
  CardContent
} from "@material-ui/core"

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"
import AddIcon from "@material-ui/icons/Add"

import Layout from "../components/layout"
import ToppingImage from "../components/topping"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toppingsGrid: {
      maxHeight: "600px",
      overflowY: "auto",
    },
    toppings: {
      width: "300px",
      height: "300px",
      "&:hover": {
        background: "#efefef",
      },
    },

    selectedToppings: {
      width: "300px",
      height: "300px",
      background: "#ededed",
    },

    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      position: "absolute",
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  })
)

interface Topping {
  name: string
  id: string
  image: string
}

interface State {
  stepNo: number
  cost: number
  errorStep: string | null
  ingredients: {
    [key: string]: boolean
  }
  pizza: {
    size: {
      id: string
      name: string
      price: number
      maxIngredients: number
    }
    crust: {
      id: string
      name: string
      price: number
    }
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
    `
  )

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
    `
  )

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
    `
  )

  //create styles
  const classes = useStyles()

  //state vars access
  const [stepNo, setStepNo] = useState<State["stepNo"]>(0)
  const [cost, setCost] = useState<State["cost"]>(0)
  const [errorStep, setErrorStep] = useState<State["errorStep"]>(null)
  const [pizzaSize, setPizzaSize] = useState<State["pizza"]["size"]>({
    id: "",
    name: "small",
    price: 0,
    maxIngredients: 5,
  })
  const [pizzaCrust, setPizzaCrust] = useState<State["pizza"]["crust"]>({
    id: "",
    name: "small",
    price: 0,
  })
  const [pizzaIngredients, setPizzaIngredients] = useState<
    State["pizza"]["ingredients"]
  >([])
  const [ingredients, setIngredients] = useState<State["ingredients"]>({})

  //steps
  const steps = ["Select Size", "Crust Type", "Pick Ingredients", "Your Pizza"]

  //error message per steps
  const stepErrorMsg = [
    "Please select pizza size before proceeding.",
    null,
    null,
    null,
  ]

  //event handler for size election
  const selectPizzaSize = (
    evt: React.ChangeEvent<HTMLInputElement>,
    val: string
  ) => {
    for (let sizeData of pizzaSizes.data.allSizesJson.nodes) {
      if (sizeData.id == val) {
        setPizzaSize({ ...sizeData })
        break
      }
    }
  }

  //event handler for crust selection
  const selectPizzaCrust = (
    evt: React.ChangeEvent<HTMLInputElement>,
    val: string
  ) => {
    for (let crustData of crustTypes.data.allThicknessJson.nodes) {
      if (crustData.id == val) {
        setPizzaCrust({ ...crustData })
        break
      }
    }
  }

  //event handler for ingredient selection
  const selectPizzaTopping = (id: string) => {
    let ingredientSelection = { ...ingredients }
    ingredientSelection[id] = !ingredientSelection[id]

    //count all selected toppings
    let totalToppings: number = 0
    Object.keys(ingredientSelection).forEach((key: string) => {
      if (ingredientSelection[key] === true) totalToppings++
    })

    //check toppings limit
    if (totalToppings <= pizzaSize.maxIngredients) {
      let choiceOfToppings = availableToppings.data.allToppingsJson.nodes.filter(
        (topping: Topping) => ingredientSelection[topping.id]
      )

      //assign new set of ingredient to pizza
      setPizzaIngredients(choiceOfToppings)

      //update ingredient selection flags
      setIngredients(ingredientSelection)
    }
  }

  //step back button handler
  const handleBack = () => {
    if (stepNo > 0) {
      setStepNo(stepNo => stepNo - 1)
    }
  }

  //next step button handler
  const handleNext = () => {
    //validate current step
    if (stepNo === 0) {
      if (pizzaSize.id === "") {
        setErrorStep(stepErrorMsg[stepNo])
        return
      }
    }

    if (stepNo < steps.length - 1) {
      setStepNo(stepNo => stepNo + 1)
      calculateCost() //calculate cost each step taken
    } else {
      //back to first step

      //reset everything
      resetOrder()
      setStepNo(0)
    }
  }

  //you know, calculates current cost
  const calculateCost = () => {
    let totalCost: number = 0

    if (pizzaSize.id !== "") totalCost += pizzaSize.price

    if (pizzaCrust.id !== "") totalCost += pizzaCrust.price

    totalCost +=
      pizzaIngredients.length > 3 ? (pizzaIngredients.length - 3) * 0.5 : 0

    setCost(totalCost)
  }

  //resets order states
  const resetOrder = () => {
    let ingredientSelection = { ...ingredients }

    Object.keys(ingredientSelection).forEach((key: string) => {
      ingredientSelection[key] = false
    })

    setIngredients(ingredientSelection)
    setPizzaCrust(crustTypes.data.allThicknessJson.nodes[0])
    setPizzaIngredients([])
    setCost(0)
  }

  //set default crust selection when options have been loaded
  useEffect(() => {
    if (!crustTypes.loading && !crustTypes.error && pizzaCrust.id === "") {
      setPizzaCrust(crustTypes.data.allThicknessJson.nodes[0])
    }
  }, [crustTypes])

  //create mapping of ingredient selection when ingredient options have been loaded
  useEffect(() => {
    if (
      !availableToppings.loading &&
      !availableToppings.error &&
      Object.keys(ingredients).length === 0
    ) {
      let ingredientSelection: { [key: string]: boolean } = {}
      availableToppings.data?.allToppingsJson.nodes.forEach(
        (ingredient: Topping) => {
          ingredientSelection[ingredient.id] = false
        }
      )

      setIngredients(ingredientSelection)
    }
  }, [availableToppings, setIngredients])

  return (
    <Layout>
      <Modal
        className={classes.modal}
        open={errorStep !== null}
        onClose={() => {
          setErrorStep(null)
        }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Card className={classes.paper}>
          <CardContent>{errorStep}</CardContent>
        </Card>
      </Modal>

      <Stepper activeStep={stepNo}>
        {steps.map((label, index) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
      
      <Grid container>
        <Grid item xs={12}>
          &nbsp;
        </Grid>

        <Grid container>
          
          <Grid hidden={stepNo !== 0} item xs={9}>
            {pizzaSizes.loading ? (
              <CircularProgress />
            ) : pizzaSizes.error ? (
              "Failed"
            ) : (
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <h1>Select Pizza Size</h1>
                </FormLabel>
                <RadioGroup
                  aria-label="size"
                  name="pizzaSize"
                  value={pizzaSize.id}
                  onChange={selectPizzaSize}
                >
                  {pizzaSizes.data.allSizesJson.nodes.map(
                    (sizeData: State["pizza"]["size"]) => (
                      <FormControlLabel
                        value={sizeData.id}
                        control={<Radio />}
                        label={`${sizeData.name} (${sizeData.price}$)`}
                      />
                    )
                  )}
                </RadioGroup>
              </FormControl>
            )}
          </Grid>

          <Grid hidden={stepNo !== 1} item xs={9}>
            {crustTypes.loading ? (
              <CircularProgress />
            ) : crustTypes.error ? (
              "Failed"
            ) : (
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <h1>Select Crust</h1>
                </FormLabel>
                <RadioGroup
                  aria-label="crust"
                  name="pizzaCrust"
                  value={pizzaCrust.id}
                  onChange={selectPizzaCrust}
                >
                  {crustTypes.data.allThicknessJson.nodes.map(
                    (crustData: State["pizza"]["crust"]) => (
                      <FormControlLabel
                        value={crustData.id}
                        control={<Radio />}
                        label={`${crustData.name} (+${crustData.price}$)`}
                      />
                    )
                  )}
                </RadioGroup>
              </FormControl>
            )}
          </Grid>

          <Grid hidden={stepNo !== 2} item xs={9}>
            {availableToppings.loading ? (
              <CircularProgress />
            ) : availableToppings.error ? (
              "Failed"
            ) : (
              <>
                <h1>Additional Toppings</h1>
                <Grid
                  container
                  justify="center"
                  spacing={2}
                  className={classes.toppingsGrid}
                >
                  {availableToppings.data.allToppingsJson.nodes.map(
                    (topping: Topping) => (
                      <Grid key={topping.id} item>
                        <Paper
                          className={
                            ingredients[topping.id]
                              ? classes.selectedToppings
                              : classes.toppings
                          }
                          elevation={ingredients[topping.id] ? 20 : 1}
                          onClick={() => {
                            selectPizzaTopping(topping.id)
                          }}
                        >
                          <div style={{ marginLeft: "10px" }}>
                            {topping.name}
                          </div>
                          <ToppingImage
                            filepath={topping.image}
                          />
                        </Paper>
                      </Grid>
                    )
                  )}
                </Grid>
              </>
            )}
          </Grid>

          <Grid hidden={stepNo !== 3} item xs={9}>
            {availableToppings.loading ? (
              <CircularProgress />
            ) : availableToppings.error ? (
              "Failed"
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h4" component="h2">
                    {`${pizzaCrust.name} crust ${pizzaSize.name} sized pizza`}
                  </Typography>
                  <Typography color="textSecondary">&nbsp;</Typography>
                  <Typography variant="body2" component="p">
                    <List>
                      {pizzaIngredients.map((topping: Topping, n: number) => (
                        <ListItem>
                          <ListItemIcon>
                            <AddIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${topping.name}${
                              n > 2 ? " (+ 0.5$)" : ""
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Typography>
                </CardContent>
                <CardActions></CardActions>
              </Card>
            )}
          </Grid>

          <Grid
            item
            xs={3}
            style={{
              textAlign: "center",
              padding: "70px 0",
            }}
          >
            <h1>Total</h1>
            <h1>${cost}</h1>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          &nbsp;
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            disabled={stepNo === 0}
            onClick={handleBack}
          >
            Back
          </Button>{" "}
          <Button variant="contained" color="primary" onClick={handleNext}>
            {stepNo === steps.length - 2
              ? "Finish"
              : stepNo === steps.length - 1
              ? "Restart"
              : "Next"}
          </Button>
        </Grid>
        <Grid item xs={12}>
          &nbsp;
        </Grid>
      </Grid>
    </Layout>
  )
}

export default IndexPage
