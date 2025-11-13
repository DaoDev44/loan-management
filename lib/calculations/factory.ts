import type {
  InterestCalculationType,
  InterestCalculationStrategy,
  CalculationStrategyFactory,
} from './types'

/**
 * Concrete implementation of the calculation strategy factory
 */
export class ConcreteCalculationStrategyFactory implements CalculationStrategyFactory {
  private strategies = new Map<InterestCalculationType, InterestCalculationStrategy>()

  /**
   * Register a new calculation strategy
   */
  register(strategy: InterestCalculationStrategy): void {
    this.strategies.set(strategy.type, strategy)
  }

  /**
   * Create strategy instance for given calculation type
   */
  create(type: InterestCalculationType): InterestCalculationStrategy {
    const strategy = this.strategies.get(type)
    if (!strategy) {
      throw new Error(
        `No strategy registered for calculation type: ${type}. Available types: ${this.getAvailableTypes().join(
          ', '
        )}`
      )
    }
    return strategy
  }

  /**
   * Get all available calculation types
   */
  getAvailableTypes(): InterestCalculationType[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * Check if a calculation type is supported
   */
  isSupported(type: InterestCalculationType): boolean {
    return this.strategies.has(type)
  }

  /**
   * Get number of registered strategies
   */
  getStrategyCount(): number {
    return this.strategies.size
  }
}

/**
 * Global singleton factory instance
 */
export const calculationStrategyFactory = new ConcreteCalculationStrategyFactory()
