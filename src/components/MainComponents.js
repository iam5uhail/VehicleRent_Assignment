import React, { useEffect, useState } from 'react';

import {
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { useForm, Controller, FormProvider } from 'react-hook-form';
function getSteps() {
  return [
    'User information',
    'Number of Wheels',
    'Vehicle Type',
    'Vehicle Model',
    'Vehicle Rent Date',
  ];
}
const NameForm = () => {
  return (
    <>
      <Controller
        name="firstName"
        render={({ field }) => (
          <TextField
            id="first-name"
            label="First Name"
            variant="outlined"
            placeholder="Enter Your First Name"
            {...field}
            required
          />
        )}
      />

      <Controller
        name="lastName"
        render={({ field }) => (
          <TextField
            id="last-name"
            label="Last Name"
            variant="outlined"
            placeholder="Enter Your Last Name"
            {...field}
            required
          />
        )}
      />
    </>
  );
};

const WheelsForm = (data) => {
  return (
    <>
      <Controller
        name="wheels"
        render={({ field }) => (
          <RadioGroup {...field}>
            {data?.data.map((item, index) => (
              <FormControlLabel
                key={item.wheels}
                value={`${item.id}`}
                control={<Radio />}
                label={`${item.wheels} wheels`}
                required
              />
            ))}
          </RadioGroup>
        )}
      />
    </>
  );
};
const VehicleTypeForm = (data) => {
  let modelData = [];
  data?.data.forEach((d) => {
    if (d.id === data?.methods) {
      modelData = d.vehicles;
    }
  });
  return (
    <>
      <Controller
        name="vehicleType"
        render={({ field }) => (
          <RadioGroup {...field} required>
            {modelData.map((item, index) => (
              <FormControlLabel
                key={item.id}
                value={`${item.id}`}
                control={<Radio />}
                label={`${item.name}`}
                name="vehicleType"
                required
              />
            ))}
          </RadioGroup>
        )}
      />
    </>
  );
};
const VehicleModelForm = (data) => {
  console.log('geeting model ', data);
  const [response, setResponse] = useState();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const vehicleData = await fetch(
      `https:octalogic-test-frontend.vercel.app/api/v1/vehicles/${data?.methods}`
    );
    const res = (await vehicleData.json()).data;
    console.log(res);
    setResponse(res);
  };

  return (
    <>
      <br></br>
      <h1>Name: {response?.name}</h1>
      <br></br>
      <img src={response?.image?.publicURL} alt="" className="w-[400px]"></img>
      <br></br>
    </>
  );
};
const VehicleRentForm = (data) => {
  const [response, setResponse] = useState();
  const [disabledRanges, setDisabledRanges] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const vehicleData = await fetch(
      `https:octalogic-test-frontend.vercel.app/api/v1/bookings/${data?.methods}`
    );
    const res = (await vehicleData.json()).data;
    console.log('date respone', res);
    if (res) {
      setResponse(res);
      const arr = [];
      res?.forEach((d) => {
        console.log(new Date(d.endDate));
        let s = new Date(d.endDate);
        arr.push({
          start: new Date(d.startDate),
          end: s,
        });
      });
      setDisabledRanges(arr);
      console.log(arr);
    }
  };

  const shouldDisableDate = (day) => {
    return disabledRanges.some((range) => {
      const dayTime = new Date(day).getTime();
      return dayTime >= range.start.getTime() && dayTime <= range.end.getTime();
    });
  };

  return (
    <>
      <Controller
        name="date"
        render={({ field }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateRangePicker']}>
              <DateRangePicker
                localeText={{ start: 'start date', end: 'end date' }}
                shouldDisableDate={shouldDisableDate}
                required
                {...field}
              />
            </DemoContainer>
          </LocalizationProvider>
        )}
      />
    </>
  );
};

const MainComponents = () => {
  const methods = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      wheels: '',
      vehicleType: '',
    },
  });
  const [data, setData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [successMessage, setSucessMessage] = useState(false);
  const steps = getSteps();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const data = await fetch(
      'https:octalogic-test-frontend.vercel.app/api/v1/vehicleTypes'
    );
    const response = await data.json();
    console.log(response.data);
    setData(response.data);
  };
  const handleNext = (data) => {
    console.log(data);
    if (activeStep === 4) {
      localStorage.setItem('userData', JSON.stringify(data));
      setSucessMessage(true);
    } else {
      setActiveStep(activeStep + 1);
      setSucessMessage(false);
    }
  };
  return (
    <div className=" ">
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((step, index) => {
          const labelProps = {};
          const stepProps = {};

          return (
            <Step {...stepProps} key={index}>
              <StepLabel {...labelProps}>{step}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box className=" mt-20 mx-80 flex flex-col justify-center items-center ">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleNext)}>
            {activeStep === 0 ? <NameForm /> : <></>}
            {activeStep === 1 ? <WheelsForm data={data} /> : <></>}
            {activeStep === 2 ? (
              <VehicleTypeForm
                data={data}
                methods={methods.getValues('wheels')}
              />
            ) : (
              <></>
            )}
            {activeStep === 3 ? (
              <VehicleModelForm
                data={data}
                methods={methods.getValues('vehicleType')}
              />
            ) : (
              <></>
            )}
            {activeStep === 4 ? (
              <VehicleRentForm
                data={data}
                methods={methods.getValues('vehicleType')}
              />
            ) : (
              <></>
            )}
            {successMessage ? (
              <h1>ThankYou Your Response is Submitted... </h1>
            ) : (
              <></>
            )}
            <Box className={' mt-4 flex gap-8'}>
              <Button
                className={'w-52 '}
                variant="outlined"
                onClick={() =>
                  activeStep > 0
                    ? (setActiveStep(activeStep - 1), setSucessMessage(false))
                    : ''
                }
              >
                back
              </Button>
              <Button
                className={'w-52 '}
                variant="contained"
                color="primary"
                type="submit"
              >
                {activeStep === 4 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </div>
  );
};

export default MainComponents;
