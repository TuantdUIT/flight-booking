import { CreatePassengerSchema } from '../validations/create-passenger';

export class PassengersService {
  async createPassenger(passengerData: CreatePassengerSchema) {
    // NOTE: Add your passenger creation logic here
    console.log(passengerData);

    // NOTE: Replace with your actual passenger data
    return {
      id: '1',
      ...passengerData,
    };
  }
}

export const passengersService = new PassengersService();
