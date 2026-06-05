export const JOIN_THE_RIDE_USER = {
  firstName: 'ragini',
  lastName: 'singh',
  email: 'shiransingh1251@gmail.com',
  mobile: '9569736649',
  city: 'chandauli',
  pincode: '560041',
  dob: '2008-05-15'
};

export function buildJoinTheRideUser() {
  return {
    ...JOIN_THE_RIDE_USER
  };
}
