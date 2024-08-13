import { Currency } from '../../models/currency.enum';
import { JobInformation } from '../../models/job-information';
import { PriceConverter } from './price-converter.interface';

const PRICE_VALUE_SELECTOR = '.andes-money-amount__fraction';
const PRICE_SYMBOL_SELECTOR = '.andes-money-amount__currency-symbol';
const TIME_SYMBOL = `⏱️`;

export class MeliPriceConverter implements PriceConverter {
  constructor(
    private _document: Document,
    private _jobInformation: JobInformation,
  ) {}

  convert(): void {
    this.replacePrices();
    this.replaceSymbols();

    const cents = this._document.querySelectorAll('.andes-money-amount__cents');
    cents.forEach((centElement) => {
      (centElement as HTMLElement).style.display = 'none';
    });
  }

  revert(): void {
    throw new Error('Method not implemented.');
  }

  private replacePrices(): void {
    const prices = this._document.querySelectorAll(
      `${PRICE_VALUE_SELECTOR}:not(.time-convertion, .converted)`,
    );

    if (!prices) return;

    prices.forEach((priceElement: Element) => {
      const price = +priceElement!.textContent!.replace(/\./g, '');
      const priceConvertion = this._jobInformation.getTimeConvertion(
        price,
        this.getElementCurrency(priceElement),
      );

      const timeConvertionElement = priceElement.cloneNode() as Element;
      timeConvertionElement.classList.add('time-convertion');
      timeConvertionElement.textContent = `${priceConvertion.toShortStringRepresentation()}`;

      priceElement.insertAdjacentElement('beforebegin', timeConvertionElement);
      priceElement.classList.add('converted');
    });
  }

  private getElementCurrency(element: Element): Currency {
    const isPriceInDolars =
      element.parentElement?.ariaLabel?.includes('dólares');

    return isPriceInDolars ? Currency.USD : Currency.ARS;
  }

  private replaceSymbols(): void {
    const currencySimbols = this._document.querySelectorAll(
      PRICE_SYMBOL_SELECTOR,
    );
    currencySimbols.forEach((symbolElement) => {
      symbolElement.replaceWith(TIME_SYMBOL);
    });
  }
}
