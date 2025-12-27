// ID randomize function for Equality by Design
export default function randomFourDigit(number) {
  // Convert number to string for processing
  let numStr = number.toString();

  // If the number is already 4 digits, return it as an integer
  if (numStr.length === 4) {
      return parseInt(numStr);
  }

  // Calculate how many digits need to be added
  const missingDigits = 4 - numStr.length;

  // Generate a string of random digits of the required length
  const randomDigits = Array.from({ length: missingDigits }, () => {
    return Math.floor(Math.random() * 10);
  }).join('');

  // Randomly decide to prepend or append random digits
  if (Math.random() > 0.5) {
      numStr = randomDigits + numStr;  // prepend
  } else {
      numStr = numStr + randomDigits;  // append
  }

  // Return the transformed number
  return parseInt(numStr);
}
