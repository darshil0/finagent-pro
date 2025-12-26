import { describe, it, expect } from 'vitest';

// Sample utility function (you can replace with your actual utils)
const add = (a: number, b: number): number => a + b;

describe('Utility Functions', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const num1 = 5;
    const num2 = 10;

    // Act
    const result = add(num1, num2);

    // Assert
    expect(result).toBe(15);
  });

  it('should handle negative numbers', () => {
    // Arrange
    const num1 = -5;
    const num2 = -10;

    // Act
    const result = add(num1, num2);

    // Assert
    expect(result).toBe(-15);
  });
});
