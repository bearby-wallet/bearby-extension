<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { uuidv4 } from 'lib/crypto/uuid';

  const dispatch = createEventDispatcher();
  const id = uuidv4();
  export let checked = false;
  export let disabled = false;

  const handleOnChange = () => {
    if (!disabled) {
      dispatch('toggle', !checked);
    }
  };
</script>

<input
  class="tgl-ios"
  id={id}
  type="checkbox"
  checked={checked}
  disabled={disabled}
  oninput={handleOnChange}
/>
<label
  class="tgl-btn"
  for={id}
></label>

<style lang="scss">
  @import "../styles/mixins";
  input {
    display: none;

    + .tgl-btn {
      outline: 0;
      display: block;
      width: 36pt;
      height: 20pt;
      position: relative;
      cursor: pointer;
      user-select: none;

      border-radius: 2em;
      padding: 2pt;
      transition: all .4s ease;

      &:after,
      &:before {
        position: relative;
        display: block;
        content: "";
        width: 50%;
        height: 100%;
      }

      &:after {
        
        left: 0;
      }

      &:before {
        display: none;
      }
    }

    &:checked + .tgl-btn:after {
      left: 50%;
    }
    &:disabled {
      + .tgl-btn {
        opacity: 0.3;
      }
    }
  }
  .tgl-ios {
    + .tgl-btn {
      // background: var(--card-color);
      border-radius: 2em;
      padding: 2pt;
      transition: all .4s ease;
      border: 1px solid var(--muted-color);
      &:after {
        border-radius: 2em;
        background: var(--primary-color);
        transition:
          left .3s cubic-bezier(
            0.175, 0.885, 0.320, 1.275
          ),
          padding .3s ease, margin .3s ease;
      }

      &:hover:after {
        will-change: padding;
      }

      &:active {
        &:after {
          padding-right: .8em;
        }
      }
    }

    &:checked + .tgl-btn {
      background: var(--primary-light-color);
      border-color: transparent;
      &:active {
        box-shadow: none;
        &:after {
          margin-left: -.8em;
        }
      }
    }
  }
</style>
