/**
 * Класс ошибок валидации
 * Используется в моделях
 */
class ValidationError extends Error {
  constructor( ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.code = 'ER-VALIDATION';
  }
}

// экспортируем
exports.ValidationError = ValidationError;